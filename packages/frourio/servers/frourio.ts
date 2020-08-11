import express from 'express'
import { apply } from './frourio/$app'

apply(express()).listen(3000)
