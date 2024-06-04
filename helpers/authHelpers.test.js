import { verifyPassword } from "./authHelpers.js";

test("verifying abcd for password", () => {
  expect(
    verifyPassword(
      "abcd",
      "f225cf17f408efab90c2aa3014e47a1c7437512a:50546fb0c8811f0b1e37c48674e3aa8c49833b2eb6201360d8d8cdee3c9ba252745df6ff644901f2066231204c506b4367ed453a3dc973a12c0c1347d22a2a60"
    )
  ).toBe(true);
});
test("verifying abcd for password", () => {
  expect(
    verifyPassword(
      "abcd",
      "68f32a5121b1b483e957ea23d3d2f7af6c10ef22:b32a20f76c4e7f32b822f3e52642b38f279c11e5c59ee2ff68ac23089f83ecac098f49b642e7ebda99a2d322410d37cdd5c4844008fc2a5a945b2f90293d3054"
    )
  ).toBe(true);
});
