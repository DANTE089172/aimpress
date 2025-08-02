import React from 'react';
import StudentStickyNoteCard from './StudentStickyNoteCard';
import ProfessionalStickyNoteCard from './ProfessionalStickyNoteCard';

// Main component that decides which card to render based on audience mode
export default function StickyNoteCard({ audienceMode, ...props }) {
  if (audienceMode === 'student') {
    return <StudentStickyNoteCard {...props} />;
  }
  
  return <ProfessionalStickyNoteCard {...props} />;
}