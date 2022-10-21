import './style.css';
import { beneficiarySettlements } from './data';
import GreenMarkerIcon from './markers/green_MarkerA.png';
import BlueMarkerIcon from './markers/blue_MarkerB.png';
import YellowMarkerIcon from './markers/yellow_MarkerC.png';
import OrangeMarkerIcon from './markers/orange_MarkerD.png';
import RedMarkerIcon from './markers/red_MarkerE.png';
import { MapService } from './maps.service';

const envConfig = import.meta.env;

const getMarkerIcon = (maxTaxReturn: number) => {
  if (maxTaxReturn >= 40000) {
    return GreenMarkerIcon;
  }
  if (maxTaxReturn >= 30000) {
    return BlueMarkerIcon;
  }
  if (maxTaxReturn >= 20000) {
    return YellowMarkerIcon;
  }
  if (maxTaxReturn >= 10000) {
    return OrangeMarkerIcon;
  }
  return RedMarkerIcon;
};

const init = async () => {
  try {
    const mapService = await MapService.init(envConfig.VITE_GOOGLE_API_KEY);
    for (const bs of beneficiarySettlements) {
      const maxTaxReturn = Math.floor((bs.maxIncome * bs.percent) / 100);
      mapService.addMarker(
        bs.coordinates!,
        getMarkerIcon(maxTaxReturn),
        String(maxTaxReturn)
      );
    }
  } catch (e) {
    console.error(e);
  }
};

void init();
