/**
 * ─────────────────────────────────────────────────────────────────────────────
 * DriveClone MCP Server
 * Model Context Protocol-compatible server that exposes DriveClone tools
 * to AI agents (Claude Desktop, LLM pipelines, etc.)
 *
 * Run: node mcp/mcpServer.js
 * ─────────────────────────────────────────────────────────────────────────────
 */

const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Folder = require('../models/Folder');
const Image = require('../models/Image');
const { upload } = require('../config/cloudinary');
const { calculateFolderSize } = require('../services/folderService');

dotenv.config({ path: '../.env' });

const app = express();
app.use(express.json());

// ─── Connect to DB ────────────────────────────────────────────────────────────
mongoose.connect(process.env.MONGO_URI).then(() => console.log('MCP: MongoDB Connected'));

// ─── MCP Tool Definitions ─────────────────────────────────────────────────────
const MCP_TOOLS = [
  {
    name: 'create_folder',
    description: 'Create a new folder. Can create nested folders by specifying parentFolderId.',
    inputSchema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Name of the folder to create' },
        parentFolderId: { type: 'string', description: 'Optional parent folder ID for nesting' },
        ownerId: { type: 'string', description: 'User ID of the folder owner' },
        color: { type: 'string', description: 'Optional hex color for the folder', default: '#F59E0B' },
      },
      required: ['name', 'ownerId'],
    },
  },
  {
    name: 'list_folders',
    description: 'List folders for a user. Optionally filter by parent folder.',
    inputSchema: {
      type: 'object',
      properties: {
        ownerId: { type: 'string', description: 'User ID' },
        parentFolderId: { type: 'string', description: 'Optional parent folder ID (null = root)' },
      },
      required: ['ownerId'],
    },
  },
  {
    name: 'get_folder_size',
    description: 'Get the total recursive size of a folder including all nested images.',
    inputSchema: {
      type: 'object',
      properties: {
        folderId: { type: 'string', description: 'Folder ID to calculate size for' },
        ownerId: { type: 'string', description: 'Owner ID for access control' },
      },
      required: ['folderId', 'ownerId'],
    },
  },
  {
    name: 'list_images',
    description: 'List all images inside a specific folder.',
    inputSchema: {
      type: 'object',
      properties: {
        folderId: { type: 'string', description: 'Folder ID to list images from' },
        ownerId: { type: 'string', description: 'Owner ID for access control' },
      },
      required: ['folderId', 'ownerId'],
    },
  },
];

// ─── MCP: List Tools ──────────────────────────────────────────────────────────
app.get('/mcp/tools', (req, res) => {
  res.json({ tools: MCP_TOOLS });
});

// ─── MCP: Execute Tool ────────────────────────────────────────────────────────
app.post('/mcp/execute', async (req, res) => {
  const { tool, input } = req.body;

  if (!tool || !input) {
    return res.status(400).json({ error: 'Missing tool name or input' });
  }

  try {
    switch (tool) {
      case 'create_folder': {
        const { name, parentFolderId, ownerId, color } = input;

        let depth = 0;
        let path = '/';

        if (parentFolderId) {
          const parent = await Folder.findOne({ _id: parentFolderId, owner: ownerId });
          if (!parent) return res.status(404).json({ error: 'Parent folder not found' });
          depth = parent.depth + 1;
          path = `${parent.path}${parent._id}/`;
        }

        const folder = await Folder.create({
          name,
          parentFolder: parentFolderId || null,
          owner: ownerId,
          depth,
          path,
          color: color || '#F59E0B',
        });

        return res.json({
          success: true,
          result: { message: `Folder "${name}" created`, folder },
        });
      }

      case 'list_folders': {
        const { ownerId, parentFolderId } = input;

        const folders = await Folder.find({
          owner: ownerId,
          parentFolder: parentFolderId || null,
        }).sort({ name: 1 });

        const foldersWithSize = await Promise.all(
          folders.map(async (f) => ({
            ...f.toObject(),
            size: await calculateFolderSize(f._id, ownerId),
          }))
        );

        return res.json({ success: true, result: { count: foldersWithSize.length, folders: foldersWithSize } });
      }

      case 'get_folder_size': {
        const { folderId, ownerId } = input;

        const folder = await Folder.findOne({ _id: folderId, owner: ownerId });
        if (!folder) return res.status(404).json({ error: 'Folder not found' });

        const size = await calculateFolderSize(folderId, ownerId);

        return res.json({
          success: true,
          result: {
            folderId,
            name: folder.name,
            sizeBytes: size,
            sizeFormatted: formatBytes(size),
          },
        });
      }

      case 'list_images': {
        const { folderId, ownerId } = input;

        const folder = await Folder.findOne({ _id: folderId, owner: ownerId });
        if (!folder) return res.status(404).json({ error: 'Folder not found' });

        const images = await Image.find({ folder: folderId, uploadedBy: ownerId });

        return res.json({ success: true, result: { count: images.length, images } });
      }

      default:
        return res.status(400).json({ error: `Unknown tool: ${tool}` });
    }
  } catch (err) {
    console.error('[MCP Error]', err);
    res.status(500).json({ error: err.message });
  }
});

// ─── MCP: SSE endpoint (for Claude Desktop integration) ───────────────────────
app.get('/mcp/sse', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Send tool list on connect
  res.write(`data: ${JSON.stringify({ type: 'tools', tools: MCP_TOOLS })}\n\n`);

  req.on('close', () => {
    console.log('MCP SSE client disconnected');
  });
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatBytes = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// ─── Start MCP Server ─────────────────────────────────────────────────────────
const MCP_PORT = process.env.MCP_PORT || 5001;
app.listen(MCP_PORT, () => {
  console.log(`🤖 MCP Server running on port ${MCP_PORT}`);
  console.log(`   Tools endpoint: http://localhost:${MCP_PORT}/mcp/tools`);
  console.log(`   Execute endpoint: http://localhost:${MCP_PORT}/mcp/execute`);
  console.log(`   SSE endpoint: http://localhost:${MCP_PORT}/mcp/sse`);
});
