import { useIsHydrated } from '@teable/sdk/hooks';
import { Allotment } from 'allotment';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { autoMationContext } from './context';
import { Menu } from './menu';
import { menuData } from './mock';
import { RightSider, FormPanel } from './right-sider';
import { WorkFlowPanel } from './workflow-panel';
import 'allotment/dist/style.css';

const AutoMationPage = () => {
  const [menuVisible, setMenuVisible] = useState(true);
  const [rightSiderVisible, setRightSiderVisible] = useState(true);
  const toggleMenu = (visible: boolean) => {
    setMenuVisible(visible);
  };
  const router = useRouter();

  const isHydrated = useIsHydrated();

  useEffect(() => {
    const {
      query: { automationId, actionId },
    } = router;
    if (actionId && automationId) {
      setRightSiderVisible(true);
    } else {
      setRightSiderVisible(false);
    }
  }, [router]);

  // TODO mock data, need to replace real data
  const [data, setMenuData] = useState(menuData);

  return isHydrated ? (
    <autoMationContext.Provider
      value={{
        menuVisible,
        toggleMenu,
        rightSiderVisible,
        setRightSiderVisible,
        menuData: data,
        setMenuData,
      }}
    >
      <div className="p-t-4 p-r-4 p-l-4 flex size-full justify-between">
        <>
          <Allotment className="w-full">
            {menuVisible && (
              <Allotment.Pane minSize={250} maxSize={350} preferredSize={300}>
                <Menu></Menu>
              </Allotment.Pane>
            )}
            <Allotment.Pane preferredSize="100%">
              <WorkFlowPanel></WorkFlowPanel>
            </Allotment.Pane>
            {rightSiderVisible && (
              <Allotment.Pane minSize={320} maxSize={370} preferredSize={320}>
                <RightSider>
                  <FormPanel></FormPanel>
                </RightSider>
              </Allotment.Pane>
            )}
          </Allotment>
        </>
      </div>
    </autoMationContext.Provider>
  ) : null;
};
export { AutoMationPage };
