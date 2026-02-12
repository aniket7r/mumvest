export interface SmartSwap {
  id: string;
  category: SwapCategory;
  title: string;
  description: string;
  potentialMonthlySaving: number;
  isRebeccaPick: boolean;
}

export type SwapCategory =
  | 'groceries'
  | 'subscriptions'
  | 'energy'
  | 'transport'
  | 'dining'
  | 'kids'
  | 'shopping';

export interface SmartSwapState {
  swapId: string;
  isAdopted: boolean;
  adoptedAt: string | null;
  followUpSent: boolean;
}
