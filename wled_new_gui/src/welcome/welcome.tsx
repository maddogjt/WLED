import { JSX } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { useSelector } from 'predux/preact';
import { selectConnectionState } from '../features/connection';
import { selectThemeSettings } from '../features/localSettings';
import { selectInfo, selectLoading } from '../features/wledState';
import { Colors } from './Colors';
import { Effects } from './Effects';
import { Favorites } from './Favorites';
import { Footer } from './Footer';
import { Header } from './Header';
import { Info } from './Info';
import { Nodes } from './Nodes';
import { Segments } from './Segments';
import { Swipey } from './SwipeContainer';

export function Welcome(props: { page?: number }): JSX.Element {
  const loading = useSelector(selectLoading);
  if (loading) {
    return <div class="overlay">Loading WLED UI...</div>;
  }

  return <MainContent {...props} />;
}

export function MainContent(props: { page?: number }): JSX.Element {
  const themeSettings = useSelector(selectThemeSettings);
  const loading = useSelector(selectLoading);
  const info = useSelector(selectInfo);
  const [showInfo, setShowInfo] = useState(false);
  const [showNodes, setShowNodes] = useState(false);
  const [page, setPage] = useState(props.page ?? 0);
  const connectionState = useSelector(selectConnectionState);

  const si = (i: boolean) => {
    setShowNodes(false);
    setShowInfo(i);
  };
  const sn = (i: boolean) => {
    setShowInfo(false);
    setShowNodes(i);
  };
  if (loading) {
    return <div class="overlay">Loading WLED UI...</div>;
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    document.documentElement.classList.remove('theme-light', 'theme-dark');
    document.documentElement.classList.add(`theme-${themeSettings.base}`);
  },
   [themeSettings.base])

  return (
    <div
      class="h-100 d-flex flex-column"
      style={{ '--t-b': themeSettings.alpha.tab }}
    >
      <Header showInfo={showInfo} setShowInfo={si} />
      <div class="d-flex flex-column flex-fill overflow-hidden position-relative">
        <div class="flex-fill overflow-hidden position-relative">
          <Swipey enabled={true} page={page} onPageChange={setPage}>
            <div id="Colors" class="tabcontent">
              <Colors />
            </div>
            <div id="Effects" class="tabcontent">
              <Effects />
            </div>
            <div id="Segments" class="tabcontent">
              <Segments />
            </div>
            <div id="Favorites" class="tabcontent">
              <Favorites />
            </div>
          </Swipey>
          <div id="connind" data-state={connectionState} />
          <div id="toast" />
          <div class="namelabel" onClick={() => sn(true)}>
            {info?.name}
          </div>
        </div>
        <div>
          <Footer page={page} setPage={setPage} />
        </div>
        <Nodes show={showNodes} setShow={sn} />
        <Info show={showInfo} setShow={si} setShowNodes={sn} />
      </div>
    </div>
  );
}
