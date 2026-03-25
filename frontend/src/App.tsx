import { useCallback, useEffect, useState } from 'react'
import {
  addBomLine,
  createBom,
  createPart,
  getHealth,
  listBomLines,
  listBoms,
  listParts,
  type Bom,
  type BomLine,
  type Part,
} from './api'
import './App.css'

function App() {
  const [apiOk, setApiOk] = useState<boolean | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [parts, setParts] = useState<Part[]>([])
  const [boms, setBoms] = useState<Bom[]>([])
  const [selectedBomId, setSelectedBomId] = useState<number | ''>('')
  const [bomLines, setBomLines] = useState<BomLine[]>([])

  const [partName, setPartName] = useState('')
  const [partNumber, setPartNumber] = useState('')
  const [partDesc, setPartDesc] = useState('')
  const [partAssembly, setPartAssembly] = useState(false)
  const [partFormError, setPartFormError] = useState<string | null>(null)

  const [bomName, setBomName] = useState('')
  const [bomDesc, setBomDesc] = useState('')
  const [bomFormError, setBomFormError] = useState<string | null>(null)

  const [linePartId, setLinePartId] = useState<number | ''>('')
  const [lineQty, setLineQty] = useState('1')
  const [lineUom, setLineUom] = useState('ea')
  const [lineNotes, setLineNotes] = useState('')
  const [lineFormError, setLineFormError] = useState<string | null>(null)

  const refreshData = useCallback(async () => {
    const [p, b] = await Promise.all([listParts(), listBoms()])
    setParts(p)
    setBoms(b)
    return { parts: p, boms: b }
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const h = await getHealth()
        if (!cancelled) setApiOk(h.status === 'ok')
        await refreshData()
      } catch (e) {
        if (!cancelled) {
          setApiOk(false)
          setLoadError(e instanceof Error ? e.message : 'Request failed')
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [refreshData])

  useEffect(() => {
    if (selectedBomId === '') {
      setBomLines([])
      return
    }
    let cancelled = false
    listBomLines(selectedBomId)
      .then((lines) => {
        if (!cancelled) setBomLines(lines)
      })
      .catch(() => {
        if (!cancelled) setBomLines([])
      })
    return () => {
      cancelled = true
    }
  }, [selectedBomId])

  async function onCreatePart(e: React.FormEvent) {
    e.preventDefault()
    setPartFormError(null)
    const name = partName.trim()
    if (!name) {
      setPartFormError('Name is required.')
      return
    }
    try {
      await createPart({
        name,
        part_number: partNumber.trim() || null,
        description: partDesc.trim() || null,
        is_assembly: partAssembly,
      })
      setPartName('')
      setPartNumber('')
      setPartDesc('')
      setPartAssembly(false)
      await refreshData()
    } catch (err) {
      setPartFormError(err instanceof Error ? err.message : 'Failed to create part')
    }
  }

  async function onCreateBom(e: React.FormEvent) {
    e.preventDefault()
    setBomFormError(null)
    const name = bomName.trim()
    if (!name) {
      setBomFormError('Name is required.')
      return
    }
    try {
      const bom = await createBom({
        name,
        description: bomDesc.trim() || null,
      })
      setBomName('')
      setBomDesc('')
      await refreshData()
      setSelectedBomId(bom.id)
    } catch (err) {
      setBomFormError(err instanceof Error ? err.message : 'Failed to create BOM')
    }
  }

  async function onAddLine(e: React.FormEvent) {
    e.preventDefault()
    setLineFormError(null)
    if (selectedBomId === '') {
      setLineFormError('Select a BOM first.')
      return
    }
    if (linePartId === '') {
      setLineFormError('Choose a part.')
      return
    }
    const qty = Number(lineQty)
    if (!Number.isFinite(qty) || qty <= 0) {
      setLineFormError('Quantity must be a positive number.')
      return
    }
    try {
      await addBomLine(selectedBomId, {
        part_id: linePartId,
        quantity: qty,
        uom: lineUom.trim() || 'ea',
        notes: lineNotes.trim() || null,
      })
      setLineQty('1')
      setLineNotes('')
      const lines = await listBomLines(selectedBomId)
      setBomLines(lines)
    } catch (err) {
      setLineFormError(err instanceof Error ? err.message : 'Failed to add line')
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>BOM Manager</h1>
        <p className="tagline">
          Add parts, create BOMs, and add lines with quantity and UOM.
        </p>
      </header>

      <section className="panel">
        <h2>Backend</h2>
        {apiOk === null && <p className="muted">Checking API…</p>}
        {apiOk === true && (
          <p className="ok">
            Connected — {parts.length} part{parts.length === 1 ? '' : 's'},{' '}
            {boms.length} BOM{boms.length === 1 ? '' : 's'}.
          </p>
        )}
        {apiOk === false && (
          <p className="err">
            Could not reach the API. Start: <code>cd backend && python run.py</code>
            {loadError ? ` — ${loadError}` : ''}
          </p>
        )}
      </section>

      <section className="panel">
        <h2>Parts</h2>
        <form className="form" onSubmit={onCreatePart}>
          <div className="form-row">
            <label>
              Name <span className="req">*</span>
              <input
                value={partName}
                onChange={(e) => setPartName(e.target.value)}
                placeholder="e.g. M3 screw"
                autoComplete="off"
              />
            </label>
            <label>
              Part #
              <input
                value={partNumber}
                onChange={(e) => setPartNumber(e.target.value)}
                placeholder="SKU-001"
                autoComplete="off"
              />
            </label>
          </div>
          <label>
            Description
            <input
              value={partDesc}
              onChange={(e) => setPartDesc(e.target.value)}
              placeholder="Optional"
            />
          </label>
          <label className="checkbox">
            <input
              type="checkbox"
              checked={partAssembly}
              onChange={(e) => setPartAssembly(e.target.checked)}
            />
            Assembly (has subparts in the API; UI for children next)
          </label>
          {partFormError && <p className="form-err">{partFormError}</p>}
          <button type="submit">Add part</button>
        </form>

        {parts.length === 0 ? (
          <p className="muted table-hint">No parts yet — add one above.</p>
        ) : (
          <table className="data">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Part #</th>
                <th>Asm</th>
              </tr>
            </thead>
            <tbody>
              {parts.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.name}</td>
                  <td>{p.part_number ?? '—'}</td>
                  <td>{p.is_assembly ? 'Yes' : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="panel">
        <h2>BOMs</h2>
        <form className="form" onSubmit={onCreateBom}>
          <div className="form-row">
            <label>
              BOM name <span className="req">*</span>
              <input
                value={bomName}
                onChange={(e) => setBomName(e.target.value)}
                placeholder="e.g. Widget rev A"
                autoComplete="off"
              />
            </label>
            <label>
              Description
              <input
                value={bomDesc}
                onChange={(e) => setBomDesc(e.target.value)}
                placeholder="Optional"
              />
            </label>
          </div>
          {bomFormError && <p className="form-err">{bomFormError}</p>}
          <button type="submit">Create BOM</button>
        </form>

        <div className="subhead">Open a BOM</div>
        {boms.length === 0 ? (
          <p className="muted table-hint">Create a BOM above, then pick it here.</p>
        ) : (
          <select
            className="select-bom"
            value={selectedBomId}
            onChange={(e) => {
              const v = e.target.value
              setSelectedBomId(v === '' ? '' : Number(v))
            }}
          >
            <option value="">— Select —</option>
            {boms.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} (id {b.id})
              </option>
            ))}
          </select>
        )}

        {selectedBomId !== '' && (
          <>
            <div className="subhead">Add line to this BOM</div>
            <form className="form form-lines" onSubmit={onAddLine}>
              <div className="form-row form-row-tight">
                <label>
                  Part
                  <select
                    value={linePartId}
                    onChange={(e) => {
                      const v = e.target.value
                      setLinePartId(v === '' ? '' : Number(v))
                    }}
                  >
                    <option value="">— Choose part —</option>
                    {parts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                        {p.part_number ? ` (${p.part_number})` : ''}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Qty
                  <input
                    type="text"
                    inputMode="decimal"
                    value={lineQty}
                    onChange={(e) => setLineQty(e.target.value)}
                  />
                </label>
                <label>
                  UOM
                  <input
                    value={lineUom}
                    onChange={(e) => setLineUom(e.target.value)}
                    placeholder="ea"
                  />
                </label>
              </div>
              <label>
                Notes
                <input
                  value={lineNotes}
                  onChange={(e) => setLineNotes(e.target.value)}
                  placeholder="Optional"
                />
              </label>
              {lineFormError && <p className="form-err">{lineFormError}</p>}
              <button type="submit" disabled={parts.length === 0}>
                Add line
              </button>
            </form>

            <div className="subhead">Lines</div>
            {bomLines.length === 0 ? (
              <p className="muted table-hint">No lines on this BOM yet.</p>
            ) : (
              <table className="data">
                <thead>
                  <tr>
                    <th>Part</th>
                    <th>Qty</th>
                    <th>UOM</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {bomLines.map((line) => (
                    <tr key={line.id}>
                      <td>{line.part_name}</td>
                      <td>{line.quantity}</td>
                      <td>{line.uom}</td>
                      <td>{line.notes ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </section>
    </div>
  )
}

export default App
