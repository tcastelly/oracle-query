# oracle-query

Provide a query builder library to construct / execute Oracle queries.
   
## Init the database connection
```typescript
import { Db } from 'oracle-query';

Db.init({
  credentials: {
    user: string,
    password: string,
    connectString: string,
  },
  onExec?: (db: Db<any>, outBinds: any) => any,
});
```
   
`onExec` hook will be executed after each query. Useful to map the result or add logging.

## Default use case:

```typescript
import { Db, createQuery } from 'oracle-query';

const query = createQuery()
  .pkg('pkg')
  .func('auth')
  .params({
    username: 'tcy',
    pwd: 'a-password',
  });

console.log(query.toString());

/*
  BEGIN 
  :res := pkg.auth(
    USERNAME => 'tcy', 
    PWD      => 'a-password'
  ); 
  END;
*/
```
