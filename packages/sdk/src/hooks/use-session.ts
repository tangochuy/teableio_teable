import { useContext, useMemo } from 'react';
import { SessionContext } from '../context';

export const useSession = () => {
  const { user, refresh } = useContext(SessionContext);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return useMemo(() => ({ user: user!, refresh }), [user, refresh]);
};
