import { useEffect, useRef, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import type { Artwork, ApiResponse } from '../types';
interface Props {
  selectedIds: Set<number>;
  setSelectedIds: React.Dispatch<React.SetStateAction<Set<number>>>;
}

const ROWS_PER_PAGE = 12;

export default function ArtworkTable({ selectedIds, setSelectedIds }: Props) {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [page, setPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectCount, setSelectCount] = useState('');
  const op = useRef<OverlayPanel>(null);

  useEffect(() => {
    fetchData(page);
  }, [page]);

  const fetchData = async (pageNum: number) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.artic.edu/api/v1/artworks?page=${pageNum}&limit=${ROWS_PER_PAGE}&fields=id,title,place_of_origin,artist_display,inscriptions,date_start,date_end`
      );
      const json: ApiResponse = await res.json();
      setArtworks(json.data);
      setTotalRecords(json.pagination.total);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  // selected rows for current page only (for DataTable prop)
  const selectedRows = artworks.filter(a => selectedIds.has(a.id));

  const onSelectionChange = (e: { value: Artwork[] }) => {
    const currentPageIds = new Set(artworks.map(a => a.id));
    const newSelected = new Set(selectedIds);

    // remove all current page ids first
    currentPageIds.forEach(id => newSelected.delete(id));

    // add back only what's selected now
    e.value.forEach(a => newSelected.add(a.id));

    setSelectedIds(newSelected);
  };

  const handleCustomSelect = () => {
    const count = parseInt(selectCount);
    if (!count || count <= 0) return;

    const newSelected = new Set(selectedIds);

    // only select from current page rows, no fetching other pages
    const toSelect = artworks.slice(0, count);
    toSelect.forEach(a => newSelected.add(a.id));

    setSelectedIds(newSelected);
    op.current?.hide();
    setSelectCount('');
  };

  const chevronHeader = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      <Button
        icon="pi pi-chevron-down"
        text
        size="small"
        style={{ padding: 0 }}
        onClick={(e) => op.current?.toggle(e)}
      />
      <OverlayPanel ref={op}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '4px' }}>
          <span>Select rows</span>
          <InputText
            value={selectCount}
            onChange={e => setSelectCount(e.target.value)}
            placeholder="Enter number"
            type="number"
          />
          <Button label="Submit" size="small" onClick={handleCustomSelect} />
        </div>
      </OverlayPanel>
    </div>
  );

  const paginatorLeft = (
    <span style={{ fontSize: '14px' }}>
      Showing <b>{(page - 1) * ROWS_PER_PAGE + 1}</b> to{' '}
      <b>{Math.min(page * ROWS_PER_PAGE, totalRecords)}</b> of <b>{totalRecords}</b> entries
    </span>
  );

  return (
    <DataTable
      value={artworks}
      loading={loading}
      dataKey="id"
      selection={selectedRows}
      onSelectionChange={onSelectionChange}
      selectionMode="multiple"
      lazy
      paginator
      rows={ROWS_PER_PAGE}
      totalRecords={totalRecords}
      first={(page - 1) * ROWS_PER_PAGE}
      onPage={(e) => setPage(Math.floor(e.first / ROWS_PER_PAGE) + 1)}
      paginatorLeft={paginatorLeft}
      paginatorTemplate="PrevPageLink PageLinks NextPageLink"
      tableStyle={{ minWidth: '60rem' }}
    >
      <Column selectionMode="multiple" header={chevronHeader} style={{ width: '3rem' }} />
      <Column field="title" header="Title" />
      <Column field="place_of_origin" header="Place of Origin" />
      <Column field="artist_display" header="Artist" />
      <Column field="inscriptions" header="Inscriptions" body={(row) => row.inscriptions ?? 'N/A'} />
      <Column field="date_start" header="Start Date" />
      <Column field="date_end" header="End Date" />
    </DataTable>
  );
}