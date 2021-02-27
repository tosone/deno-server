TARGET = server

build:
	deno compile -o bin/$(TARGET) --allow-all --unstable --config ./tsconfig.json app.ts

release:
	deno compile -o bin/$(TARGET) --allow-all --unstable --config ./tsconfig.json --lite app.ts

run:
	deno run --allow-all --config ./tsconfig.json app.ts
