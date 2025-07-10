declare module 'next/server' {
  export interface NextRequest extends Request {
    nextUrl: URL;
  }
  export class NextResponse extends Response {
    static json(data: any, init?: ResponseInit): NextResponse;
  }
}