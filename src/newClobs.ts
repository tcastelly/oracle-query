import { Readable } from 'stream';
import oracledb, { Lob } from 'oracledb';

type StrList = {
  [id: string]: Readable,
}

// convert list of readable to list of Promise<oracle.Lob>
export default function (connection: oracledb.Connection, strList: StrList) {
  const initial: { [id: string]: Promise<Lob> } = {};

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
