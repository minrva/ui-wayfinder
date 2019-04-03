# ui-wayfinder

Copyright (C) 2016-2019 The Open Library Foundation

This software is distributed under the terms of the Apache License, Version 2.0. See the file "[LICENSE](LICENSE)" for more information.

## Introduction

This is a [Stripes UI module](https://github.com/folio-org/stripes/blob/master/doc/new-development-setup.md) for finding the location of an item on a map.

## Install UI-Wayfinder

1. Load the Stripes platform configuration file into an editor.

    ``` bash
    code ~/Desktop/folio/ui/platform-complete/stripes.config.js
    ```

2. Add `@folio/wayfinder` and `@folio/plugin-find-item` as an entry to the `modules` section.

    ```javascript
        modules: {
            ...
            '@folio/plugin-find-vendor' : {},
            '@folio/vendors' : {},
            '@folio/wayfinder': {},
            ...
        }
    ```

3. Download `ui-wayfinder` to the `node_modules/@folio` directory and rename the directory.

    ```bash
    cd ~/Desktop/folio/ui/platform-complete/node_modules/@folio
    git clone https://code.library.illinois.edu/scm/fol/ui-wayfinder.git
    mv ui-wayfinder wayfinder
    ```

## Modify Instances.js

In order for `plugin-find-instance` to work properly, `Instances.js` from the `inventory` module has to be modified.

```bash
cp ~/Desktop/folio/ui/platform-complete/node_modules/@folio/wayfinder/artifacts/Instances.js.bak ~/Desktop/folio/ui/platform-complete/node_modules/@folio/inventory/src/Instances.js
```

## Install and Deploy Okapi Gateway

A suitable Okapi gateway will need to be running. The [Folio testing-backend Vagrant box](https://app.vagrantup.com/folio/boxes/testing-backend) is one way to quickly deploy an Okapi gateway locally.

## Register UI Module with the Okapi Gateway

Once you have your Okapi instance deployed, you will need to register meta-data about your UI Module. 

[Stripes CLI](https://github.com/folio-org/stripes-cli) is the easiest way to make the appropriate HTTP requests to the Okapi gateway, so we will assume you have installed the command line tool.

1. *After deploying your Okapi gateway*, then change to your UI Module root directory.

```bash
cd ~/Desktop/folio/ui/platform-complete/node_modules/@folio/wayfinder
```

2. Login to the Okapi gateway using the `diku_admin` user and the `diku` tenant.

```bash
stripes okapi login diku_admin --okapi http://localhost:9130 --tenant diku
```

3. Generate and add a UI Module Descriptor to the Okapi gateway automatically, based on the permission set found in `package.json`. 

```bash
stripes mod add --okapi http://localhost:9130 --tenant diku
```

4. Enable UI Module for `diku` tenant.

```bash
stripes mod enable --okapi http://localhost:9130 --tenant diku
```

5. Assign default permissions for `diku` tenant.

```bash
stripes perm assign --name module.wayfinder.enabled --okapi http://localhost:9130 --tenant diku --user diku_admin
stripes perm assign --name settings.wayfinder.enabled --okapi http://localhost:9130 --tenant diku --user diku_admin
```

6. Logout

```bash
stripes okapi logout --okapi http://localhost:9130 --tenant diku
```

Further material on adding permissions can be found at [Adding new permissions to FOLIO UI modules](https://github.com/folio-org/stripes-core/blob/master/doc/adding-permissions.md#add-the-permissions-to-the-package-file) and [Stripes CLI User Guide](https://github.com/folio-org/stripes-cli/blob/master/doc/user-guide.md#assigning-permissions).

## Deploy UI-Wayfinder

1. Deploy the corresponding Okapi services by following [mod-wayfinder README](https://code.library.illinois.edu/projects/FOL/repos/mod-wayfinder/browse/README.md).
1. Deploy the `platform-complete`.
    ```bash
    cd ~/Desktop/folio/ui/platform-complete
    yarn start
    ```

## What to do next?

Read the [Stripes Module Developer's Guide](https://github.com/folio-org/stripes-core/blob/master/doc/dev-guide.md).