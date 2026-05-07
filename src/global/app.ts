import '@material/web/tabs/tabs.js';
import '@material/web/tabs/primary-tab.js';
import '@material/web/icon/icon.js';
import '@material/web/chips/chip-set.js';
import '@material/web/chips/filter-chip.js';
import { registerNavigationApi } from './navigation.js'

export default function () {
  registerNavigationApi();
}
