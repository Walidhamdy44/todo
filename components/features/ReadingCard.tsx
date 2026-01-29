'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { ExternalLink, Clock, Tag, Pencil, Trash2 } from 'lucide-react';
import type { ReadingItem } from '@/types';
import { Card, PriorityBadge, StatusBadge, Badge } from '@/components/ui';

interface ReadingCardProps {
    item: ReadingItem;
    onEdit?: (item: ReadingItem) => void;
    onDelete?: (itemId: string) => void;
    className?: string;
}

export function ReadingCard({ item, onEdit, onDelete, className }: ReadingCardProps) {
    const getCategoryColor = (category: string) => {
        const colors: Record<string, 'info' | 'warning' | 'success'> = {
            'technical': 'info',
            'business': 'warning',
            'personal-development': 'success',
        };
        return colors[category] || 'default' as 'info';
    };

    const formatCategory = (category: string) => {
        return category
            .split('-')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const formatReadingTime = (minutes: number) => {
        if (minutes < 60) return `${minutes} min`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    };

    return (
        <Card className={cn('group relative', className)} padding="md" hover>
            {/* Action buttons */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                <a
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-400 hover:text-blue-500 transition-colors"
                >
                    <ExternalLink className="w-4 h-4" />
                </a>
                {onEdit && (
                    <button
                        onClick={() => onEdit(item)}
                        className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                    >
                        <Pencil className="w-4 h-4" />
                    </button>
                )}
                {onDelete && (
                    <button
                        onClick={() => onDelete(item.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-400 hover:text-red-500 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Header badges */}
            <div className="flex items-center gap-2 flex-wrap pr-20">
                <Badge variant={getCategoryColor(item.category)} size="sm">
                    {formatCategory(item.category)}
                </Badge>
                <PriorityBadge priority={item.priority} />
                <StatusBadge status={item.status} type="reading" />
            </div>

            {/* Title & Source */}
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mt-3 line-clamp-2">
                {item.title}
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                {item.source}
            </p>

            {/* Meta */}
            <div className="flex items-center gap-4 mt-4">
                <div className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                    <Clock className="w-4 h-4" />
                    {formatReadingTime(item.estimatedReadingTime)}
                </div>
            </div>

            {/* Tags */}
            {item.tags.length > 0 && (
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex-wrap">
                    {item.tags.slice(0, 3).map((tag) => (
                        <span
                            key={tag}
                            className="text-xs px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                        >
                            #{tag}
                        </span>
                    ))}
                    {item.tags.length > 3 && (
                        <span className="text-xs text-zinc-400 dark:text-zinc-500">
                            +{item.tags.length - 3} more
                        </span>
                    )}
                </div>
            )}
        </Card>
    );
}
