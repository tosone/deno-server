TARGET = server
ENTRY  = app.ts

FLAGS   = --allow-all --unstable --config ./tsconfig.json

TARGETS = x86_64-unknown-linux-gnu x86_64-pc-windows-msvc x86_64-apple-darwin

run:
	deno run $(FLAGS) $(ENTRY)

build:
	deno compile -o bin/$(TARGET) $(FLAGS) $(ENTRY)

matrix:
	@for target in $(TARGETS); do                                                      \
	  echo Building $${target};                                                        \
		if [ ! -d bin/$${target} ]; then                                                 \
			mkdir bin/$${target};                                                          \
		fi;                                                                              \
	  deno compile -o bin/$${target}/$(TARGET) $(FLAGS) --target $${target} $(ENTRY);  \
	done
