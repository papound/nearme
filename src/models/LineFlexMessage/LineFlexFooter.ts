import { LineFlexBody } from './LineFlexBody';
import { LineFlexHero } from './LineFlexHero';
import { LineFlexInnerContents } from './LineFlexInnerContents';

export class LineFlexFooter {
  public type: string;
  public layout: string;
  public flex: number;
  public spacing: string;
  public contents?: LineFlexInnerContents[];
}
