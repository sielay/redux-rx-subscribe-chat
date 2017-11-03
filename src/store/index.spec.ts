import "jasmine";
import { subscribeToUser, fetchUser, store, sendNewMessage } from "./index";

describe("Store", () => {

    it('Updates', (done) => {

        let latestHenry = null;

        let unsubscribe = subscribeToUser('henry', (userState: any) => {
            latestHenry = userState;
        });

        store.dispatch(fetchUser('henry'));

        expect(latestHenry).toBeDefined();
        expect(latestHenry.username).toBe('henry');
        expect(latestHenry.online).toBeFalsy();

        store.dispatch(sendNewMessage('henry', 'hello'));

        expect(latestHenry.online).toBeTruthy();

        done();

    });

});