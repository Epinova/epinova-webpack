const config = require("../config");
const serializer = require("jest-serializer-path");

expect.addSnapshotSerializer(serializer);

test("errors", () => {
    expect(() => config(undefined)).toThrowError();
    expect(() => config("dist", {})).toThrowError();
});

test("configuration", () => {
    const path = "public";

    const env = "test";
    const argv = {
        mode: "development"
    };

    const c = config({ path }, (config, configEnv, configArgv) => {
        config.entry = "./Scripts/global/index.js";

        expect(configEnv).toEqual(env);
        expect(configArgv).toEqual(argv);

        return config;
    });

    const value = c(env, argv);

    expect(typeof c).toEqual("function");
    expect(typeof value).toEqual("object");
    expect(value.entry).toEqual("./Scripts/global/index.js");
    expect(value.devServer.publicPath.includes(path)).toEqual(true);
    expect(value.output.publicPath).toEqual(`/${path}/`);
});

test("development", () => {
    expect(
        config({ path: "dist" })("development", { mode: "development" })
    ).toMatchSnapshot();
});

test("production", () => {
    expect(
        config({ path: "dist" })("production", { mode: "production" })
    ).toMatchSnapshot();
});
