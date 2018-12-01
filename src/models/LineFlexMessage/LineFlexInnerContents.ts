import { LineFlexAction } from './LineFlexAction';

export class LineFlexInnerContents {
  public type?: string;
  public text?: string;
  public size?: string;
  public weight?: string;
  public height?: string;
  public style?: string;
  public wrap?: boolean;
  public contents?: LineFlexInnerContents[];
  public action?: LineFlexAction;
  public url?: string;
  public color?: string;
  public layout?: string;
  public align?: string;
  public margin?: string;
  public flex?: number;
}
