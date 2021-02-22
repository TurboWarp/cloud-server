This is the location to put filter lists. Any files in this folder that end with `.filter` will automatically be loaded by the naughty word detector. `private.filter` is explicitly ignored in the gitignore, use that for your private filters (create the file yourself).

The version of cloud-server used by forkphorus has an additional set of filters not found here.

## File Format

One regular expression per line. Each expression is case insensitive. Anything that isn't alphanumeric is removed before the regex runs.

Lines that start with # are comments and are ignored. Empty lines are ignored.
