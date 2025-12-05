import * as React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card, CardContent } from './card';
import { cn } from '@/lib/utils';

interface DragDropExampleProps {
  items: string[];
  onReorder?: (items: string[]) => void;
  className?: string;
}

export const DragDropExample: React.FC<DragDropExampleProps> = ({
  items: initialItems,
  onReorder,
  className,
}) => {
  const [items, setItems] = React.useState(initialItems);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const newItems = Array.from(items);
    const [reorderedItem] = newItems.splice(result.source.index, 1);
    newItems.splice(result.destination.index, 0, reorderedItem);

    setItems(newItems);
    onReorder?.(newItems);
  };

  return (
    <div className={cn('w-full', className)}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="droppable">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {items.map((item, index) => (
                <Draggable key={item} draggableId={item} index={index}>
                  {(provided, snapshot) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={cn(
                        'mb-2 cursor-move transition-all border-primary/20',
                        snapshot.isDragging && 'shadow-lg border-primary bg-primary/5'
                      )}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-primary"
                          >
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <line x1="5" y1="6" x2="19" y2="6" />
                            <line x1="5" y1="18" x2="19" y2="18" />
                          </svg>
                          <span className="text-foreground">{item}</span>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};
