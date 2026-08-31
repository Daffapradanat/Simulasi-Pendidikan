import { fetchAuth } from './fetchAuth';

export const syncProgressWithServer = async (
  userId: number | string,
  playedGames: number[],
  completedModuleIds: number[],
  reflections: Record<number, string>
) => {
  try {
    const res = await fetchAuth(`/api/users/${userId}/progress`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('simpend_token')}`
      },
      body: JSON.stringify({ playedGames, completedModuleIds, reflections })
    });
    
    if (res.ok) {
      localStorage.removeItem(`simpend_pending_sync_${userId}`);
      return true;
    }
    throw new Error('Failed to sync');
  } catch (err) {
    console.error('Offline sync queued:', err);
    localStorage.setItem(`simpend_pending_sync_${userId}`, JSON.stringify({
      playedGames, completedModuleIds, reflections
    }));
    return false;
  }
};
