import { test } from "node:test";
import assert from "node:assert/strict";
import { guard } from "./+guard.ts";

// KAN-81: an unverified, signed-in user opening /signup used to be sent straight to
// the Explore feed instead of /verify, because the verified check didn't exist yet.
function redirectTargetOf(fn: () => void): string {
    try {
        fn();
    } catch (e: any) {
        const target = e?._pageContextAbort?._urlRedirect?.url;
        assert.ok(target, `expected a vike redirect, got: ${JSON.stringify(e)}`);
        return target;
    }
    throw new Error("expected guard() to throw a redirect");
}

function pageContext(user: any, origin?: string) {
    return {
        user,
        urlParsed: { search: origin ? { origin } : {} },
    } as any;
}

test("sends an unverified signed-in user to /verify, not the feed", () => {
    const target = redirectTargetOf(() =>
        guard(pageContext({ id: "u1", verified: false })),
    );
    assert.equal(target, "/verify");
});

test("sends an unverified signed-in user to /verify even with an origin param queued up", () => {
    const target = redirectTargetOf(() =>
        guard(pageContext({ id: "u1", verified: false }, "/manage/join?packId=x")),
    );
    assert.equal(target, "/verify");
});

test("sends a verified signed-in user to their origin, when given", () => {
    const target = redirectTargetOf(() =>
        guard(pageContext({ id: "u1", verified: true }, "/manage/join")),
    );
    assert.equal(target, "/manage/join");
});

test("sends a verified signed-in user with no origin to the feed", () => {
    const target = redirectTargetOf(() =>
        guard(pageContext({ id: "u1", verified: true })),
    );
    assert.equal(target, "/feed");
});

test("does nothing for a signed-out visitor (lets them see the signup page)", () => {
    assert.doesNotThrow(() => guard(pageContext(null)));
});
