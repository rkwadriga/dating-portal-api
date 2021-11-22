import {Controller, SerializeOptions} from "@nestjs/common";

@Controller('/api/profile')
@SerializeOptions({strategy: 'excludeAll'})
export class ProfileController {
    constructor(

    ) {}
}