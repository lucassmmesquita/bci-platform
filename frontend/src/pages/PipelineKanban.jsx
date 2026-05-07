import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DndContext, closestCorners, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GitBranch, GripVertical, User } from 'lucide-react';
import { ScoreBadge } from '../components/ui';
import { mockPipeline } from '../mocks/pipeline';
import { PIPELINE_STAGES, SETORES } from '../constants';

function KanbanCard({ item, isDragging }) {
  const slaColors = { green: '#00C48C', yellow: '#FFB020', red: '#FF4757' };
  return (
    <div style={{
      background: '#fff', borderRadius: 12, padding: 14, border: '1px solid var(--g200)',
      boxShadow: isDragging ? 'var(--shadow-lg)' : 'var(--shadow-xs)', cursor: 'grab',
      transition: 'box-shadow 0.2s, transform 0.2s', opacity: isDragging ? 0.8 : 1,
      transform: isDragging ? 'rotate(3deg)' : 'none',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--g900)' }}>{item.nome_startup}</span>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: slaColors[item.sla] || slaColors.green }} />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: 'var(--g500)', background: 'var(--g100)', padding: '2px 8px', borderRadius: 6, fontWeight: 500 }}>
          {SETORES.find(x => x.value === item.setor)?.label || item.setor}
        </span>
        <ScoreBadge score={item.score} size="sm" />
      </div>
      {item.responsavel && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
          <div style={{ width: 20, height: 20, borderRadius: 6, background: 'var(--primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User style={{ width: 10, height: 10, color: '#fff' }} />
          </div>
          <span style={{ fontSize: 11, color: 'var(--g500)' }}>{item.responsavel}</span>
        </div>
      )}
    </div>
  );
}

function SortableCard({ item }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: `card-${item.id}` });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <KanbanCard item={item} isDragging={isDragging} />
    </div>
  );
}

export default function PipelineKanban() {
  const [pipeline, setPipeline] = useState(mockPipeline);
  const [activeCard, setActiveCard] = useState(null);
  const navigate = useNavigate();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const findColumn = (id) => {
    const cardId = typeof id === 'string' ? parseInt(id.replace('card-', '')) : id;
    for (const [col, items] of Object.entries(pipeline)) {
      if (items.some(i => i.id === cardId)) return col;
    }
    return null;
  };

  const handleDragStart = (event) => {
    const cardId = parseInt(event.active.id.replace('card-', ''));
    for (const items of Object.values(pipeline)) {
      const found = items.find(i => i.id === cardId);
      if (found) { setActiveCard(found); break; }
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveCard(null);
    if (!over) return;

    const activeCol = findColumn(active.id);
    let overCol = null;
    // Check if dropped over a column
    if (PIPELINE_STAGES.some(s => s.key === over.id)) {
      overCol = over.id;
    } else {
      overCol = findColumn(over.id);
    }
    if (!activeCol || !overCol || activeCol === overCol) return;

    const cardId = parseInt(active.id.replace('card-', ''));
    setPipeline(prev => {
      const newPipeline = { ...prev };
      const card = newPipeline[activeCol].find(i => i.id === cardId);
      newPipeline[activeCol] = newPipeline[activeCol].filter(i => i.id !== cardId);
      newPipeline[overCol] = [...(newPipeline[overCol] || []), card];
      return newPipeline;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="animate-fadeIn">
      <div>
        <h1 className="font-display" style={{ fontSize: 24, fontWeight: 700, color: 'var(--g900)', margin: 0 }}>Pipeline</h1>
        <p style={{ fontSize: 14, color: 'var(--g500)', margin: '4px 0 0' }}>Venture Building — arraste para mover entre estágios</p>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 16 }} className="scrollbar-hide">
          {PIPELINE_STAGES.map(stage => {
            const items = pipeline[stage.key] || [];
            return (
              <div key={stage.key} id={stage.key} style={{ minWidth: 260, maxWidth: 280, flex: '0 0 260px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, padding: '0 4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 4, background: stage.color }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--g900)' }}>{stage.label}</span>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--g500)', background: 'var(--g100)', padding: '2px 8px', borderRadius: 6 }}>{items.length}</span>
                </div>
                <div style={{ background: 'var(--g50)', borderRadius: 12, border: '1px dashed var(--g200)', padding: 8, minHeight: 120, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <SortableContext items={items.map(i => `card-${i.id}`)} strategy={verticalListSortingStrategy}>
                    {items.map(item => <SortableCard key={item.id} item={item} />)}
                  </SortableContext>
                  {items.length === 0 && <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--g400)', padding: 16 }}>Solte aqui</p>}
                </div>
              </div>
            );
          })}
        </div>
        <DragOverlay>{activeCard ? <KanbanCard item={activeCard} isDragging /> : null}</DragOverlay>
      </DndContext>
    </div>
  );
}
