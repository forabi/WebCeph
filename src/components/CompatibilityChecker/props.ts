export interface StateProps {
  open: boolean;
  isChecking: boolean;
  missingFeatures: MissingBrowserFeature[];
  recommendedBrowsers: {
    id: string;
    icon: string;
    downloadUrl: string;
  }[];
  shouldUpgradeCurrentBrowser: boolean;
  currentBrowser: Browser;
  isNerdMode: boolean;
}

export interface DispatchProps {
  onDialogClosed: () => void;
}

export interface OwnProps {
  className?: string;
  userAgent: string;
}

export type ConnectableProps = StateProps & DispatchProps;

export type Props = StateProps & DispatchProps & OwnProps;

export default Props;
