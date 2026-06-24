import React from 'react';
import { Construction } from 'lucide-react';

export default function GenericAdminPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <Construction size={64} className="text-gray-300 mb-6" />
      <h1 className="text-3xl font-serif font-bold text-primary mb-4">{title}</h1>
      <p className="text-gray-500 max-w-md">
        This section is currently under construction. CRUD functionality for {title.toLowerCase()} will be available in the next update.
      </p>
    </div>
  );
}
