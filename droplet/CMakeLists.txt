cmake_minimum_required(VERSION 3.13)

project(droplet LANGUAGES C)

add_subdirectory(libwebsockets)

set(CMAKE_C_FLAGS_DEBUG "-g -Wall -pedantic ${CMAKE_C_FLAGS_DEBUG}")
set(CMAKE_C_FLAGS_RELEASE "-g -Wall -pedantic -O3 -march=native ${CMAKE_C_FLAGS_RELEASE}")

add_executable(
	droplet
	droplet/droplet.c
	droplet/protocol_cloud.c
	droplet/resizable_buffer.c
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
	droplet/resizable_buffer_test.c
	droplet/resizable_buffer.c
)
