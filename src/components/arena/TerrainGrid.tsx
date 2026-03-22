'use client';

interface TerrainCell {
  x: number;
  z: number;
  type: 'normal' | 'hazard' | 'resource' | 'fortress' | 'void';
  elevation?: number;
}

interface TerrainGridProps {
  size?: number;
  cells?: TerrainCell[];
}

const CELL_COLORS: Record<string, string> = {
  normal: '#1a1a2e',
  hazard: '#ff004020',
  resource: '#00ff8820',
  fortress: '#8b5cf620',
  void: '#00000080',
};

const CELL_BORDER: Record<string, string> = {
  normal: '#ffffff08',
  hazard: '#ff004040',
  resource: '#00ff8840',
  fortress: '#8b5cf640',
  void: '#00000000',
};

export function TerrainGrid({ size = 10, cells = [] }: TerrainGridProps) {
  const cellMap = new Map(cells.map(c => [`${c.x},${c.z}`, c]));

  return (
    <div className="inline-grid gap-0.5" style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>
      {Array.from({ length: size * size }, (_, i) => {
        const x = i % size;
        const z = Math.floor(i / size);
        const cell = cellMap.get(`${x},${z}`);
        const type = cell?.type || 'normal';
        return (
          <div key={i}
            className="w-8 h-8 rounded-sm transition-all hover:opacity-80"
            style={{
              background: CELL_COLORS[type],
              border: `1px solid ${CELL_BORDER[type]}`,
              opacity: type === 'void' ? 0.2 : 1,
            }}
            title={`(${x},${z}) ${type}`}
          />
        );
      })}
    </div>
  );
}
export default TerrainGrid;
