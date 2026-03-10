import {fileURLToPath} from "node:url"

import base from "@bradgarropy/eslint-config"
import {includeIgnoreFile} from "@eslint/compat"

const gitignorePath = fileURLToPath(new URL(".gitignore", import.meta.url))

const config = [includeIgnoreFile(gitignorePath), ...base]

export default config
