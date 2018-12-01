import { LineMessage } from './LineMessage';
import { LineUser } from './LineUser';

export class LineLocationBody {
  public type: string;
  public replyToken: string;
  public source: LineUser;
  public timestamp: any;
  public message: LineMessage;
}
