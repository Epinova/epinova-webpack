interface MyInterface {
    name: string;
    valid: boolean;
}

export function createSomething(name: string) {
    const something: MyInterface = {
        name,
        valid: true,
    };

    return something;
}
