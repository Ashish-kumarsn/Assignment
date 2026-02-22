import { useState } from 'react';
import ArtworkTable from './components/table';

function App() {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  return (
    <div style={{ padding: '20px' }}>
      <h2>Art Institute of Chicago</h2>

      <p>
        Total: <b>{selectedIds.size}</b>
      </p>

      <ArtworkTable
        selectedIds={selectedIds}
        setSelectedIds={setSelectedIds}
      />
    </div>
  );
}

export default App;