import {Module} from "@nestjs/common";
import {FileSystemService} from "../service/fileSystem.service";
import {PublicController} from "./public.controller";

@Module({
    providers: [FileSystemService],
    controllers: [PublicController]
})
export class PublicModule {

}