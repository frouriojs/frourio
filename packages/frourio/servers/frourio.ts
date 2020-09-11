import express from 'express'
import frourio from './frourio/$app'

frourio(express()).listen(3000)
