import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { LucideIcon } from 'lucide-react';

interface ConceptCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  details: string[];
}

export default function ConceptCard({ title, description, icon: Icon, details }: ConceptCardProps) {
  return (
    <Card className="h-full hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-neural-gradient-subtle">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {details.map((detail, index) => (
            <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></span>
              {detail}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}