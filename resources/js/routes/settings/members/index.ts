import profile from './profile'
import color from './color'
import order from './order'

const members = {
    profile: Object.assign(profile, profile),
    color: Object.assign(color, color),
    order: Object.assign(order, order),
}

export default members