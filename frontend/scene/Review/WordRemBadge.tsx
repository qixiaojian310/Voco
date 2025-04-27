import { Badge } from '@rneui/themed';
import { RemRecords } from '../../types/Word';
import { useMemo } from 'react';

function WordRemBadge({status, time}: RemRecords) {
  const color = useMemo(() => {
    switch (status) {
      case 'forgot':
        return '#a97d7d';
      case 'vague':
        return '#a1a17d';
      case 'remember':
        return '#7a9c7a';
    }
  }, [status]);
  return (
    <Badge badgeStyle={{
      backgroundColor: color,
      borderRadius: 5,
    }}
    value={`${time} days before`} />
  );
}
export default WordRemBadge;
