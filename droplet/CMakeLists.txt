cmake_minimum_required(VERSION 3.13)

project(droplet LANGUAGES C)

add_subdirectory(libwebsockets)

# we want -fhardened but we are using too old GCC
set(CMAKE_C_FLAGS_DEBUG "-g -Wall -pedantic -fsanitize=address -D_FORTIFY_SOURCE=3 -D_GLIBCXX_ASSERTIONS -ftrivial-auto-var-init=zero -fPIE -pie -Wl,-z,relro,-z,now -fstack-protector-strong -fstack-clash-protection -fcf-protection=full ${CMAKE_C_FLAGS_DEBUG}")
set(CMAKE_C_FLAGS_RELEASE "-g -Wall -pedantic -O3 -march=native -D_FORTIFY_SOURCE=3 -D_GLIBCXX_ASSERTIONS -ftrivial-auto-var-init=zero -fPIE -pie -Wl,-z,relro,-z,now -fstack-protector-strong -fstack-clash-protection -fcf-protection=full ${CMAKE_C_FLAGS_RELEASE}")

add_executable(
	droplet
	src/droplet.c
	src/protocol_cloud.c
	src/resizable_buffer.c
)
target_include_directories(
	droplet PRIVATE
	jsmn
	${PROJECT_BINARY_DIR}/libwebsockets
	${PROJECT_BINARY_DIR}/libwebsockets/include
)
target_link_libraries(droplet websockets)

add_executable(
	resizable_buffer_test
	src/resizable_buffer_test.c
	src/resizable_buffer.c
)
