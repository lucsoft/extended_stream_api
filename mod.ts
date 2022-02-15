/**
 * Converts a string stream to multiple jsons separated by newlines
 *
 * true\nfalse\n["test"]\n => `true`, `false`, `["test"]`
 *
 * This requires that the raw jsons are only one line
 */
export class MultipartJsonStream<
    // deno-lint-ignore ban-types
    DataType extends number | boolean | object | string,
> {
    writable: WritableStream<string>;
    readable: ReadableStream<DataType>;
    cache = "";
    constructor() {
        const transformer = new TransformStream<string, DataType>({
            transform: (data, lol) => {
                if (typeof data != "string") return;
                this.cache += data;
                for (
                    const iterator of this.cache.match(/.*\n/) ?? []
                ) {
                    lol.enqueue(JSON.parse(iterator));
                }
                this.cache = this.cache.split(/\n.*$/).at(-1) ?? "";
            },
        });
        this.writable = transformer.writable;
        this.readable = transformer.readable;
    }
}
