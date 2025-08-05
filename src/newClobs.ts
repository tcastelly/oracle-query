import type { Readable } from 'node:stream';
import type { Lob } from 'oracledb';
import oracledb from 'oracledb';

type StrList = Record<string, Readable>;

// convert list of readable to list of Promise<oracle.Lob>
export default function (connection: oracledb.Connection, strList: StrList) {
  const initial: Record<string, Promise<Lob>> = {};

  return Object
    .keys(strList)
    .reduce((acc, v) => {
      acc[v] = new Promise((resolve, reject) => {
        connection.createLob(oracledb.CLOB, (err, templob) => {
          templob.on('error', (_err) => reject(_err));
          templob.on('finish', () => resolve(templob));

          strList[v].on('error', (_err) => reject(_err));
          strList[v].pipe(templob);
        });
      });

      return acc;
    }, initial);
}
