import { InMemoryDbService, RequestInfo } from 'angular-in-memory-web-api';
import { Observable, of } from 'rxjs';
import { UserData } from './models/user.model';

export class FakeBack implements InMemoryDbService {
  createDb() {
    const users = [
      {
        username: 'mbozzi',
        email: 'marcobo97@hotmail.it',
        password: '123',
      },
    ];

    return { users };
  }

  post(reqInfo: RequestInfo): Observable<any> {
    if (reqInfo.collectionName === 'users') {
      const credentials: UserData = reqInfo.utils.getJsonBody(reqInfo.req).user;

      const user: UserData = reqInfo.collection.find(
        (u: UserData) =>
          u.email == credentials.email && u.password == credentials.password
      );
      if (user) {
        return reqInfo.utils.createResponse$(() => ({
          body: { user, username: user.username },
          status: 200,
          statusText: 'OK',
        }));
      } else {
        return new Observable((observer) => {
          observer.error({
            error: 'Invalid credentials',
            status: 401,
            statusText: 'Unauthorized',
          });
        });
      }
    }

    return of(null);
  }
}
