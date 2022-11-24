import { beneficiarySettlements } from './data';
import GreenMarkerIcon from '/green_MarkerA.png';
import BlueMarkerIcon from '/blue_MarkerB.png';
import YellowMarkerIcon from '/yellow_MarkerC.png';
import OrangeMarkerIcon from '/orange_MarkerD.png';
import RedMarkerIcon from '/red_MarkerE.png';
import { MapService } from './maps.service';

const envConfig = import.meta.env;
const onLegendClick = () => {
  legendBtn.hidden = true;
  sidePanel.hidden = false;
};

const onCloseLegendClick = () => {
  sidePanel.hidden = true;
  legendBtn.hidden = false;
};

const sidePanel = document.getElementById('side-panel') as HTMLElement;
const legendBtn = document.getElementById('legend') as HTMLElement;
const sidePanelCloseBtn = document.getElementById(
  'side-panel-close-btn'
) as HTMLElement;
legendBtn.addEventListener('click', onLegendClick);
sidePanelCloseBtn.addEventListener('click', onCloseLegendClick);

const MarkerIcons = {
  A: GreenMarkerIcon,
  B: BlueMarkerIcon,
  C: YellowMarkerIcon,
  D: OrangeMarkerIcon,
  E: RedMarkerIcon,
};

const getMarkerLabel = (maxTaxReturn: number) => {
  if (maxTaxReturn >= 40000) {
    return 'A';
  }
  if (maxTaxReturn >= 30000) {
    return 'B';
  }
  if (maxTaxReturn >= 20000) {
    return 'C';
  }
  if (maxTaxReturn >= 10000) {
    return 'D';
  }
  return 'E';
};

const init = async () => {
  await Promise.all([
    import('./style.css'),
    import('bootstrap/dist/css/bootstrap.min.css'),
  ]);
  try {
    const mapService = await MapService.init(
      envConfig.VITE_GOOGLE_API_KEY || process.env.GOOGLE_API_KEY as string
    );
    for (const bs of beneficiarySettlements) {
      const maxTaxReturn = Math.floor((bs.maxIncome * bs.percent) / 100);
      bs.label = getMarkerLabel(maxTaxReturn);
      mapService.addMarker(
        bs.coordinates,
        MarkerIcons[bs.label],
        String(maxTaxReturn)
      );
    }
    const checkBoxes = document.querySelectorAll('input');
    checkBoxes.forEach(cb => {
      cb.addEventListener('click', e => {
        const target = e?.target as unknown as {
          value: keyof typeof MarkerIcons;
          checked: boolean;
        };
        const label = target.value;
        if (target.checked) {
          mapService.showMarkers(MarkerIcons[label]);
        } else {
          mapService.hideMarkers(MarkerIcons[label]);
        }
      });
    });
    sidePanel.hidden = false;
  } catch (e) {
    console.error(e);
  }
};

window.addEventListener('load', init);
