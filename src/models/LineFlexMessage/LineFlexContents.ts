import { LineFlexBody } from './LineFlexBody';
import { LineFlexFooter } from './LineFlexFooter';
import { LineFlexHeader } from './LineFlexHeader';
import { LineFlexHero } from './LineFlexHero';

export class LineFlexContents {
  public type: string;
  public header: LineFlexHeader;
  public hero: LineFlexHero;
  public body: LineFlexBody;
  public footer: LineFlexFooter;
}
