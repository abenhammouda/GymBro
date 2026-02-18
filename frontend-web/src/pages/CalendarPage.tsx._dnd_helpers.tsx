
// Component pour une zone de drop (Jour du calendrier)
function DroppableDay({ id, children, className }: { id: string, children: React.ReactNode, className?: string }) {
    const { isOver, setNodeRef } = useDroppable({
        id: id,
    });

    const style = {
        backgroundColor: isOver ? 'rgba(102, 126, 234, 0.1)' : undefined,
        height: '100%',
        minHeight: '100px', // Ensure drop target has height even if empty
    };

    return (
        <div ref={setNodeRef} style={style} className={className} data-day-id={id}>
            {children}
        </div>
    );
}

// Component pour un élément draggable (Session)
function DraggableSession({ id, children, className, style: propStyle }: { id: string, children: React.ReactNode, className?: string, style?: any }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: id,
    });

    const style = {
        ...propStyle,
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        zIndex: isDragging ? 2000 : 10,
        opacity: isDragging ? 0.7 : 1,
        touchAction: 'none', // Recommended for dnd-kit
        cursor: isDragging ? 'grabbing' : 'grab',
    };

    return (
        <div ref={setNodeRef} style={style} {...listeners} {...attributes} className={className}>
            {children}
        </div>
    );
}
