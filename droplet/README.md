# droplet

A cloud variable server in C.

```bash
rm -rf build && mkdir build && cd build && cmake -DCMAKE_BUILD_TYPE=DEBUG -DLWS_WITH_SSL=0 -DLWS_WITH_SHARED=0 -DLWS_WITH_MINIMAL_EXAMPLES=0 .. && make -j4
```

```bash
-DCMAKE_BUILD_TYPE=RELEASE
```
