import { create } from 'zustand';
import type { CombinedSelection } from '../../../grid/managers/selection-manager';
import type { IHeaderMenu, IRecordMenu, ISetting, IStatisticMenu } from './type';

interface IGridViewState {
  selection?: CombinedSelection;
  setting?: ISetting;
  headerMenu?: IHeaderMenu;
  recordMenu?: IRecordMenu;
  statisticMenu?: IStatisticMenu;
  openSetting: (props: ISetting) => void;
  closeSetting: () => void;
  openHeaderMenu: (props: IHeaderMenu) => void;
  closeHeaderMenu: () => void;
  openRecordMenu: (props: IRecordMenu) => void;
  closeRecordMenu: () => void;
  openStatisticMenu: (props: IStatisticMenu) => void;
  closeStatisticMenu: () => void;
  setSelection: (props: CombinedSelection) => void;
}

export const useGridViewStore = create<IGridViewState>((set) => ({
  openSetting: (props) => {
    set((state) => {
      return {
        ...state,
        setting: props,
      };
    });
  },
  closeSetting: () => {
    set((state) => {
      if (state.setting == undefined) {
        return state;
      }
      return {
        ...state,
        setting: undefined,
      };
    });
  },
  openHeaderMenu: (props) => {
    set((state) => {
      return {
        ...state,
        headerMenu: props,
      };
    });
  },
  closeHeaderMenu: () => {
    set((state) => {
      if (state.headerMenu == null) {
        return state;
      }
      return {
        ...state,
        headerMenu: undefined,
      };
    });
  },
  openRecordMenu: (props) => {
    set((state) => {
      return {
        ...state,
        recordMenu: props,
      };
    });
  },
  closeRecordMenu: () => {
    set((state) => {
      if (state.recordMenu == null) {
        return state;
      }
      return {
        ...state,
        recordMenu: undefined,
      };
    });
  },
  openStatisticMenu: (props) => {
    set((state) => {
      return {
        ...state,
        statisticMenu: props,
      };
    });
  },
  closeStatisticMenu: () => {
    set((state) => {
      if (state.statisticMenu == null) {
        return state;
      }
      return {
        ...state,
        statisticMenu: undefined,
      };
    });
  },
  setSelection: (props) => {
    set((state) => {
      return {
        ...state,
        selection: props,
      };
    });
  },
}));
