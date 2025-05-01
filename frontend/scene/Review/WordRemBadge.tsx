import { Badge } from '@rneui/themed';
import { RemRecords } from '../../types/Word';
import React, { useMemo } from 'react';

function WordRemBadge({record_time, memory_status}: RemRecords) {
  const color = useMemo(() => {
    switch (memory_status) {
      case 'forgot':
        return '#a97d7d';
      case 'vague':
        return '#a1a17d';
      case 'remembered':
        return '#7a9c7a';
    }
  }, [memory_status]);
  const time = useMemo(() => {
    const now = new Date();
    const record = new Date(record_time);
    const diff = now.getTime() - record.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return days;
  }, [record_time]);
  return (
    <Badge badgeStyle={{
      backgroundColor: color,
      borderRadius: 5,
    }}
    value={`${time} days before`} />
  );
}
export default WordRemBadge;
