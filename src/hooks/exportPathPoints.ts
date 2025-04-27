import { Segment } from '../types';

// Add type definitions for File System Access API
declare global {
  interface Window {
    showSaveFilePicker?: (options?: {
      suggestedName?: string;
      types?: Array<{
        description?: string;
        accept: Record<string, string[]>;
      }>;
    }) => Promise<FileSystemFileHandle>;
  }
}

interface FileSystemFileHandle {
  createWritable: () => Promise<FileSystemWritableFileStream>;
}

interface FileSystemWritableFileStream {
  write: (data: string) => Promise<void>;
  close: () => Promise<void>;
}

const exportPathPoints = async (segments: Segment[], mapInfo: {height: number, width: number}) => {
  try {
    // Extract all path points
    const pathPoints = segments.flatMap((segment) =>
      segment.path.map((point) => ({
        x: (point.x/mapInfo.width * 144).toFixed(2),
        y: (144 - point.y/mapInfo.height * 144).toFixed(2),
        head: point.head?.toFixed(2),
        vel: point.vel.toFixed(2),
        pause: point.pausetime,
      }))
    );

    // Format the data as CSV
    let csvData = pathPoints
      .map((point) => `${point.x},${point.y},${point.head},${point.vel}`)
      .join('\n');

    csvData += "\nendData"

    // Add metadata
    const now = new Date();
    const metadata = [
      `\nGenerated on: ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`,
      `\nMap dimensions: ${mapInfo.width}x${mapInfo.height}`,
      `\nTotal points: ${pathPoints.length}`,
      `\nTotal segments: ${segments.length}`,
      ''
    ];

    csvData += metadata;

    // Use File System Access API if available
    if (window.showSaveFilePicker) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName: 'path.txt',
          types: [{
            description: 'Text Files',
            accept: {
              'text/plain': ['.txt'],
            },
          }],
        });
        
        const writable = await handle.createWritable();
        await writable.write(csvData);
        await writable.close();
      } catch (err: unknown) {
        // User cancelled the save dialog
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('Error saving file:', err);
        }
        return;
      }
    } else {
      // Fallback to traditional download for browsers that don't support the API
      const fileName = prompt('Enter file name for export:', 'path');
      if (fileName === null) return; // User cancelled
      
      const blob = new Blob([csvData], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  } catch (error) {
    console.error('Error exporting path points:', error);
  }
};

export default exportPathPoints;